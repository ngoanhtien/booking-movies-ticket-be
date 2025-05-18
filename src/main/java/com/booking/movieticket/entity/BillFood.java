package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.compositekey.BillFoodId;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bill_food")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillFood extends BaseEntity {

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
