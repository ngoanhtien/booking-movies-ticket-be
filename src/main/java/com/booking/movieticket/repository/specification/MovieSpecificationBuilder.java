package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class MovieSpecificationBuilder {
    public static Specification<Movie> findByCriteria(MovieCriteria criteria) {
        Specification<Movie> spec = Specification.where(null);
        if (criteria != null && StringUtils.hasText(criteria.getName())) {
            spec = spec.and(hasName(criteria.getName()));
        }
        return spec;
    }

    private static Specification<Movie> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            String searchTerm = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm);
        };
    }
}
