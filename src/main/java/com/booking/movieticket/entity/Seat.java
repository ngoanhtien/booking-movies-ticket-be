package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.enums.TypeSeat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seat extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_seat")
    @SequenceGenerator(name = "sequence_seat")
    @Column(name = "seat_id")
    private Long id;

    @Column(name = "row_name")
    private String rowName;

    @Column(name = "column_name")
    private String columnName;

    @Column(name = "row_screen_label")
    private String rowScreenLabel;

    @Column(name = "column_screen_label")
    private String columnScreenLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_seat")
    private TypeSeat typeSeat;

    @ManyToOne
    @JoinColumn(name = "room_id", referencedColumnName = "room_id")
    private Room room;

    @OneToMany(mappedBy = "seat")
    private Set<ShowtimeSeat> showtimeSeats = new HashSet<>();

    public void addShowtimeSeat(ShowtimeSeat showtimeSeat) {
        showtimeSeats.add(showtimeSeat);
        showtimeSeat.setSeat(this);
    }

    public void removeShowtimeSeat(ShowtimeSeat showtimeSeat) {
        showtimeSeats.remove(showtimeSeat);
        showtimeSeat.setSeat(null);
    }
}
