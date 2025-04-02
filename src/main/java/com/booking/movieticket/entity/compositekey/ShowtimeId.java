package com.booking.movieticket.entity.compositekey;

import jakarta.persistence.Column;
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
    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "room_id")
    private Long roomId;
}
