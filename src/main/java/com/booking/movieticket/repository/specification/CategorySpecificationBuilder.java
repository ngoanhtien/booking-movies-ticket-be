package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.CategoryCriteria;
import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.entity.Category;
import com.booking.movieticket.entity.Cinema;
import org.springframework.data.jpa.domain.Specification;

public class CategorySpecificationBuilder {
    public static Specification<Category> findByCriteria(CategoryCriteria criteria) {
        return Specification.where(hasName(criteria.getName()));
    }

    private static Specification<Category> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
    }
}
