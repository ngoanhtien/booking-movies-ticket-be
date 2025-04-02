package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.RoomStatus;
import com.booking.movieticket.entity.enums.RoomType;
import com.booking.movieticket.entity.enums.ScreenSize;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table( name = "rooms" )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room extends BaseEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_room")
    @SequenceGenerator(name = "sequence_room")
    @Column( name = "room_id" )
    private Long id;

    @Column( name = "room_name" )
    @Nationalized
    private String name;

    @Column( name = "location" )
    @Nationalized
    private String location;

    @Column( name = "seat_numbers" )
    private Integer seatNumbers;

    @Enumerated( EnumType.STRING )
    @Column( name = "screen_size" )
    private ScreenSize screenSize;

    @Enumerated( EnumType.STRING )
    @Column( name = "room_type" )
    private RoomType roomType;

    @Enumerated( EnumType.STRING )
    @Column( name = "room_status" )
    private RoomStatus roomStatus;

    @Column( name = "number_seat_rows" )
    private Integer seatRowNumbers;

    @Column( name = "number_seat_columns" )
    private Integer seatColumnNumbers;

    @Column( name = "aisle_position" )
    private Integer aislePosition;

    @Column( name = "aisle_width" )
    private Integer aisleWidth;

    @Column( name = "aisle_height" )
    private Integer aisleHeight;

    @Column( name = "double_seat_rows" )
    private Integer doubleSeatRowNumbers;

    @Column( name = "is_enabled" )
    private Boolean isEnabled;

    @ManyToOne
    @JoinColumn( name = "branch_id", referencedColumnName = "id" )
    private Branch branch;

    @OneToMany( mappedBy = "room" )
    private Set<Showtime> showtimes = new HashSet<>();

}
