package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PostRequest;
import com.softinter.sicapi.dto.request.ReplyRequest;
import com.softinter.sicapi.dto.request.UpdateCommentRequest;
import com.softinter.sicapi.dto.response.PostResponse;
import com.softinter.sicapi.dto.response.ReplyResponse;
import com.softinter.sicapi.entity.pm.PmComment;
import com.softinter.sicapi.exception.ResourceNotFoundException;
import com.softinter.sicapi.repository.pm.PmCommentRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.DiscussionService;
import com.softinter.sicapi.util.LocalizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiscussionServiceImpl implements DiscussionService {

    private final PmCommentRepository commentRepository;
    private final SuProfileRepository profileRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getPosts(UUID targetId, String targetType, Pageable pageable) {
        Page<PmComment> posts = commentRepository.findByTargetTypeAndTargetIdAndParentCommentIsNullAndIsDeleteFalse(
                targetType, targetId, pageable
        );
        return posts.map(this::toPostResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReplyResponse> getReplies(UUID postId) {
        List<PmComment> replies = commentRepository.findByParentCommentIdAndIsDeleteFalseOrderByCreatedDateAsc(postId);
        return replies.stream().map(this::toReplyResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PostResponse createPost(PostRequest request, String userId, String userName) {
        PmComment post = new PmComment();
        post.setTargetType("PROJECT"); // ตามที่กำหนดให้เป็น PROJECT
        post.setTargetId(request.getTargetId());
        post.setSubject(request.getSubject());
        post.setContent(request.getContent());
        post.setAttachmentGroupId(request.getAttachmentGroupId());
        post.setPinned(request.getPinned() != null && request.getPinned());
        post.setCreatedBy(userId);
        post.setCreatedDate(Instant.now());
        post.setIsDelete(false);

        PmComment saved = commentRepository.save(post);
        return toPostResponse(saved);
    }

    @Override
    @Transactional
    public ReplyResponse createReply(ReplyRequest request, String userId, String userName) {
        // ตรวจสอบว่าโพสต์หลักมีอยู่จริง
        PmComment parent = commentRepository.findById(request.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        PmComment reply = new PmComment();
        reply.setTargetType(parent.getTargetType());
        reply.setTargetId(parent.getTargetId());
        reply.setParentComment(parent);
        reply.setContent(request.getContent());
        reply.setAttachmentGroupId(request.getAttachmentGroupId());
        reply.setCreatedBy(userId);
        reply.setCreatedDate(Instant.now());
        reply.setIsDelete(false);

        PmComment saved = commentRepository.save(reply);
        return toReplyResponse(saved);
    }

    @Override
    @Transactional
    public PostResponse updatePost(UUID commentId, UpdateCommentRequest request, String userId) {
        PmComment comment = findAndAuthorize(commentId, userId);
        comment.setContent(request.getContent());
        comment.setUpdatedBy(userId);
        comment.setUpdatedDate(Instant.now());
        PmComment saved = commentRepository.save(comment);
        return toPostResponse(saved);
    }

    @Override
    @Transactional
    public ReplyResponse updateReply(UUID commentId, UpdateCommentRequest request, String userId) {
        PmComment comment = findAndAuthorize(commentId, userId);
        comment.setContent(request.getContent());
        comment.setUpdatedBy(userId);
        comment.setUpdatedDate(Instant.now());
        PmComment saved = commentRepository.save(comment);
        return toReplyResponse(saved);
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId, String userId) {
        PmComment comment = findAndAuthorize(commentId, userId);
        comment.setIsDelete(true);
        comment.setDeleteBy(userId);
        comment.setDeleteDate(Instant.now());
        commentRepository.save(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canEditOrDelete(UUID commentId, String userId) {
        return commentRepository.existsByIdAndCreatedByAndIsDeleteFalse(commentId, userId);
    }

    private PmComment findAndAuthorize(UUID commentId, String userId) {
        PmComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getCreatedBy().equals(userId)) {
            throw new SecurityException("You are not allowed to modify this comment.");
        }
        return comment;
    }

    private PostResponse toPostResponse(PmComment comment) {
        PostResponse response = new PostResponse();
        response.setId(comment.getId());
        response.setSubject(comment.getSubject());
        response.setContent(comment.getContent());
        response.setCreatedBy(comment.getCreatedBy());
        response.setCreatedByName(getUserName(comment.getCreatedBy()));
        response.setCreatedDate(comment.getCreatedDate());
        response.setAttachmentGroupId(comment.getAttachmentGroupId());
        response.setPinned(comment.getPinned());
        long replyCount = commentRepository.countByParentCommentIdAndIsDeleteFalse(comment.getId());
        response.setReplyCount(replyCount);
        return response;
    }

    private ReplyResponse toReplyResponse(PmComment comment) {
        ReplyResponse response = new ReplyResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedBy(comment.getCreatedBy());
        response.setCreatedByName(getUserName(comment.getCreatedBy()));
        response.setCreatedDate(comment.getCreatedDate());
        response.setAttachmentGroupId(comment.getAttachmentGroupId());
        return response;
    }

    private String getUserName(String userId) {
        return profileRepository.findByUserId(userId)
                .map(LocalizationHelper::getFullName)
                .orElse(userId);
    }
}