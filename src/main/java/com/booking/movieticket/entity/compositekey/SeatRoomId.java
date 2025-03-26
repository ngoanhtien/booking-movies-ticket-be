package com.booking.movieticket.entity.compositekey;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class SeatRoomId implements Serializable {
    private Long roomId;
    private Long seatId;
}
