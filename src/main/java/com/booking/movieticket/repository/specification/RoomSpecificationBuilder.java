package com.booking.movieticket.repository.specification;

import com.booking.movieticket.dto.criteria.RoomCriteria;
import com.booking.movieticket.entity.Room;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class RoomSpecificationBuilder {
    public static Specification<Room> findByCriteria(RoomCriteria criteria) {
        Specification<Room> spec = Specification.where(notDeleted());
        if (criteria != null && StringUtils.hasText(criteria.getName())) {
            spec = spec.and(hasName(criteria.getName()));
        }
        return spec;
    }

    private static Specification<Room> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            String searchTerm = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm);
        };
    }

    private static Specification<Room> notDeleted() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(criteriaBuilder.isNull(root.get("isDeleted")), criteriaBuilder.notEqual(root.get("isDeleted"), true));
    }
}
