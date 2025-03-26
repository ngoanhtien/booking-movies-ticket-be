package com.booking.movieticket.entity;

import com.booking.movieticket.entity.compositekey.SeatRoomId;
import com.booking.movieticket.entity.enums.TypeSeat;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table( name = "room_seat" )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomSeat extends BaseEntity
{
    @EmbeddedId
    private SeatRoomId id;

    @MapsId( "seatId" )
    @ManyToOne
    @JoinColumn( name = "seat_id" )
    private Seat seat;

    @MapsId( "roomId" )
    @ManyToOne
    @JoinColumn( name = "room_id" )
    private Room room;

    @Enumerated( EnumType.STRING )
    @Column( name = "type_seat" )
    private TypeSeat typeSeat;
}
