package com.booking.movieticket.entity.compositekey;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class BillFoodId implements Serializable {
    private Long billId;
    private Long foodId;
}
