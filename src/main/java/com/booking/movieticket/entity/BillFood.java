package com.booking.movieticket.entity;

import com.booking.movieticket.entity.compositekeys.BillFoodId;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "bill_food")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillFood implements Serializable {

    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private BillFoodId id;

    @MapsId("billId")
    @ManyToOne
    @JoinColumn(name = "bill_id", insertable = false, updatable = false)
    private Bill bill;

    @MapsId("foodId")
    @ManyToOne
    @JoinColumn(name = "food_id", insertable = false, updatable = false)
    private Food food;

    private Integer quantity;
}
