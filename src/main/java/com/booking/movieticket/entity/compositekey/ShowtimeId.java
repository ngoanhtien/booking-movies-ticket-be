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
public class ShowtimeId implements Serializable {
    private Long scheduleId;
    private Long roomId;
}
