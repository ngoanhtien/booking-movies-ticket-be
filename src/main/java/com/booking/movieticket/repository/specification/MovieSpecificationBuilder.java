package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.dto.criteria.UserCriteria;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class MovieSpecificationBuilder {
    public static Specification<Movie> findByCriteria(MovieCriteria criteria) {
        return Specification.where(hasName(criteria.getName()));
    }

    private static Specification<Movie> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
    }
}
