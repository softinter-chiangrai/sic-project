package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PostRequest;
import com.softinter.sicapi.dto.request.ReplyRequest;
import com.softinter.sicapi.dto.request.UpdateCommentRequest;
import com.softinter.sicapi.dto.response.PostResponse;
import com.softinter.sicapi.dto.response.ReplyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface DiscussionService {

    Page<PostResponse> getPosts(UUID targetId, String targetType, Pageable pageable);

    List<ReplyResponse> getReplies(UUID postId);

    PostResponse createPost(PostRequest request, String userId, String userName);

    ReplyResponse createReply(ReplyRequest request, String userId, String userName);

    PostResponse updatePost(UUID commentId, UpdateCommentRequest request, String userId);

    ReplyResponse updateReply(UUID commentId, UpdateCommentRequest request, String userId);

    void deleteComment(UUID commentId, String userId);

    boolean canEditOrDelete(UUID commentId, String userId);
}