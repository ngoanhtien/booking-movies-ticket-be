package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.entity.Cinema;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class CinemaSpecificationBuilder {
    public static Specification<Cinema> findByCriteria(CinemaCriteria criteria) {
        Specification<Cinema> spec = Specification.where(null);
        if (criteria != null && StringUtils.hasText(criteria.getName())) {
            spec = spec.and(hasName(criteria.getName()));
        }
        return spec;
    }

    private static Specification<Cinema> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            String searchTerm = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm);
        };
    }

    private static Specification<Cinema> notDeleted() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.isNull(root.get("isDeleted")),
                criteriaBuilder.notEqual(root.get("isDeleted"), true)
        );
    }
}
