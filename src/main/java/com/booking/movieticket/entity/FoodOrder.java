package com.booking.movieticket.entity;

import com.booking.movieticket.entity.compositekeys.FoodOrderId;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "food_order")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FoodOrder implements Serializable {
    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private FoodOrderId id;

    @MapsId("orderId")
    @ManyToOne
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @MapsId("foodId")
    @ManyToOne
    @JoinColumn(name = "food_id", insertable = false, updatable = false)
    private Food food;

    private Integer quantity;
}
