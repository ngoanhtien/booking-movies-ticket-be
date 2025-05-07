package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.CategoryCriteria;
import com.booking.movieticket.entity.Category;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class CategorySpecificationBuilder {
    public static Specification<Category> findByCriteria(CategoryCriteria criteria) {
        Specification<Category> spec = Specification.where(notDeleted());
        if (criteria != null && StringUtils.hasText(criteria.getName())) {
            spec = spec.and(hasName(criteria.getName()));
        }
        return spec;
    }

    private static Specification<Category> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            String searchTerm = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm);
        };
    }

    private static Specification<Category> notDeleted() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.isNull(root.get("isDeleted")),
                criteriaBuilder.notEqual(root.get("isDeleted"), true)
        );
    }
}
