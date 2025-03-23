package com.booking.movieticket.entity;

import com.booking.movieticket.entity.compositekeys.SeatRoomId;
import com.booking.movieticket.entity.enums.TypeSeat;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "room_seat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomSeat implements Serializable {

    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private SeatRoomId id;

    @MapsId("seatId")
    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @MapsId("roomId")
    @ManyToOne()
    @JoinColumn(name = "room_id")
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_seat")
    private TypeSeat typeSeat;
}
