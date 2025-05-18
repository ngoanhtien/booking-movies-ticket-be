package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "foods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Food extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_food")
    @SequenceGenerator(name = "sequence_food")
    @Column(name = "food_id")
    private Long id;

    @Column(name = "food_name")
    private String name;

    @Column(name = "price")
    private double price;

    @Column(name = "stock")
    private int stock;

    @Column(name = "image_food", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "food")
    private Set<BillFood> billFoods = new HashSet<>();
}
