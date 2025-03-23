package com.booking.movieticket.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;
    @Nationalized
    @Column(name = "category_name", nullable = false)
    private String name;
    @Nationalized
    @Column(name = "description")
    private String description;
    @Column(name = "enabled", nullable = false)
    private boolean enabled;
}
