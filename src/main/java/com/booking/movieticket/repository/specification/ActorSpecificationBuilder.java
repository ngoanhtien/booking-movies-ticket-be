package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.ActorCriteria;
import com.booking.movieticket.entity.Actor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class ActorSpecificationBuilder {
    public static Specification<Actor> findByCriteria(ActorCriteria criteria) {
        Specification<Actor> spec = Specification.where(null);
        if (criteria != null && StringUtils.hasText(criteria.getName())) {
            spec = spec.and(hasNameLike(criteria.getName()));
        }
        return spec;
    }

    private static Specification<Actor> hasNameLike(String name) {
        return (root, query, criteriaBuilder) -> {
            String searchTerm = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("realName")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("actorName")), searchTerm)
            );
        };
    }

    private static Specification<Actor> notDeleted() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.isNull(root.get("isDeleted")),
                criteriaBuilder.notEqual(root.get("isDeleted"), true)
        );
    }
}
