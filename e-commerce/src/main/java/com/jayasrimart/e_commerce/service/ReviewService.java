package com.jayasrimart.e_commerce.service;

import com.jayasrimart.e_commerce.dto.CreateReviewRequest;
import com.jayasrimart.e_commerce.dto.ReviewDto;
import com.jayasrimart.e_commerce.entity.Product;
import com.jayasrimart.e_commerce.entity.Review;
import com.jayasrimart.e_commerce.entity.User;
import com.jayasrimart.e_commerce.exception.BadRequestException;
import com.jayasrimart.e_commerce.exception.ResourceNotFoundException;
import com.jayasrimart.e_commerce.repository.ProductRepository;
import com.jayasrimart.e_commerce.repository.ReviewRepository;
import com.jayasrimart.e_commerce.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto createReview(Long userId, Long productId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.setApproved(true); // default auto-approved for modern demo flow

        review = reviewRepository.save(review);
        return toDto(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getAllReviews(Pageable pageable) {
        return reviewRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDto);
    }

    @Transactional
    public ReviewDto updateReviewApproval(Long reviewId, boolean approved) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        review.setApproved(approved);
        review = reviewRepository.save(review);
        return toDto(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        reviewRepository.delete(review);
    }

    public ReviewDto toDto(Review review) {
        String userName = (review.getUser() != null)
                ? (review.getUser().getFirstName() + " " + (review.getUser().getLastName() != null ? review.getUser().getLastName() : "")).trim()
                : "Anonymous Customer";

        return new ReviewDto(
                review.getId(),
                review.getUser() != null ? review.getUser().getId() : null,
                userName,
                review.getProduct() != null ? review.getProduct().getId() : null,
                review.getProduct() != null ? review.getProduct().getName() : "",
                review.getRating(),
                review.getComment(),
                review.isApproved(),
                review.getCreatedAt()
        );
    }
}
