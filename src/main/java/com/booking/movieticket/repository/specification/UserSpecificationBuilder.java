package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.UserCriteria;
import com.booking.movieticket.entity.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class UserSpecificationBuilder {
    public static Specification<User> findByCriteria(UserCriteria criteria) {
        Specification<User> spec = Specification.where(null);
        if (criteria != null && StringUtils.hasText(criteria.getName())) {
            spec = spec.and(hasUserName(criteria.getName()));
        }
        return spec;
    }

    private static Specification<User> hasUserName(String name) {
        return (root, query, criteriaBuilder) -> {
            String searchTerm = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), searchTerm);
        };
    }
}
