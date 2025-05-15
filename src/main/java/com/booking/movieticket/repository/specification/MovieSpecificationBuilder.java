package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.enums.StatusMovie;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class MovieSpecificationBuilder {
    public static Specification<Movie> findByCriteria(MovieCriteria criteria) {
        Specification<Movie> spec = Specification.where(notDeleted());
        if (criteria == null) {
            return spec;
        }

        if (StringUtils.hasText(criteria.getSearchTerm())) {
            spec = spec.and(withSearchTerm(criteria.getSearchTerm()));
        }

        if (criteria.getStatus() != null) {
            spec = spec.and(hasStatus(criteria.getStatus()));
        }
        
        return spec;
    }

    private static Specification<Movie> withSearchTerm(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction(); // No search term means no additional restriction from this part
            }
            String[] searchWords = searchTerm.toLowerCase().trim().split("\\s+");
            if (searchWords.length == 0) {
                return criteriaBuilder.conjunction();
            }

            // Predicates for movie name only
            List<Predicate> nameAndPredicates = new ArrayList<>();
            for (String word : searchWords) {
                nameAndPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + word + "%"));
            }
            // All search words must be in the name
            // No longer need query.distinct(true) as we are not joining with other tables for this search logic
            return criteriaBuilder.and(nameAndPredicates.toArray(new Predicate[0]));
        };
    }

    private static Specification<Movie> notDeleted() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.isNull(root.get("isDeleted")),
                criteriaBuilder.notEqual(root.get("isDeleted"), true)
        );
    }

    private static Specification<Movie> hasStatus(StatusMovie status) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status);
    }
}
