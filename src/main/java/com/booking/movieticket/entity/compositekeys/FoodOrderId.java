package com.booking.movieticket.entity.compositekeys;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class FoodOrderId implements Serializable {
    private Long foodId;
    private Long orderId;
}
