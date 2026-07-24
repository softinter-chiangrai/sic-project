package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.PostRequest;
import com.softinter.sicapi.dto.request.ReplyRequest;
import com.softinter.sicapi.dto.request.UpdateCommentRequest;
import com.softinter.sicapi.dto.response.ApiResponse;
import com.softinter.sicapi.dto.response.PostResponse;
import com.softinter.sicapi.dto.response.ReplyResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/discussion")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Discussion", description = "Discussion Feed API")
public class DiscussionController {

    private final DiscussionService discussionService;
    private final CurrentUserService currentUserService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get project discussion posts")
    public ResponseEntity<Page<PostResponse>> getPosts(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<PostResponse> posts = discussionService.getPosts(projectId, "PROJECT", pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/post/{postId}/replies")
    @Operation(summary = "Get replies of a post")
    public ResponseEntity<List<ReplyResponse>> getReplies(@PathVariable UUID postId) {
        List<ReplyResponse> replies = discussionService.getReplies(postId);
        return ResponseEntity.ok(replies);
    }

    @PostMapping("/post")
    @Operation(summary = "Create a new post")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody PostRequest request) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();
        PostResponse created = discussionService.createPost(request, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Post created successfully"));
    }

    @PostMapping("/reply")
    @Operation(summary = "Reply to a post")
    public ResponseEntity<ApiResponse<ReplyResponse>> createReply(@Valid @RequestBody ReplyRequest request) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();
        ReplyResponse created = discussionService.createReply(request, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Reply created successfully"));
    }

    @PutMapping("/comment/{commentId}")
    @Operation(summary = "Update a comment (post or reply)")
    public ResponseEntity<ApiResponse<PostResponse>> updateComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        String userId = currentUserService.getUserId();
        // ตรวจสอบว่า comment เป็น post หรือ reply แล้วเรียก service ให้ถูก
        // เราสามารถใช้ service ที่แยกหรือรวมก็ได้
        // สมมติว่า updatePost ใช้ได้ทั้ง post และ reply (เนื่องจากใช้เนื้อหาเดียวกัน)
        PostResponse updated = discussionService.updatePost(commentId, request, userId);
        return ResponseEntity.ok(ApiResponse.success(updated, "Comment updated successfully"));
    }

    @DeleteMapping("/comment/{commentId}")
    @Operation(summary = "Delete a comment (soft delete)")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        String userId = currentUserService.getUserId();
        discussionService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}