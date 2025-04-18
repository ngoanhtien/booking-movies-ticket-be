package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.vo.UserCriteria;
import com.booking.movieticket.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecificationBuilder {
    public static Specification<User> findByCriteria(UserCriteria criteria) {
        return Specification.where(hasName(criteria.getName()));
    }

    private static Specification<User> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
    }
}
