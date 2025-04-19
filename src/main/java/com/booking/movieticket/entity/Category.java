package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_category")
    @SequenceGenerator(name = "sequence_category")
    @Column(name = "category_id")
    private Long id;

    @Nationalized
    @Column(name = "category_name", nullable = false)
    private String name;

    @Nationalized
    @Column(name = "description")
    private String description;
}
