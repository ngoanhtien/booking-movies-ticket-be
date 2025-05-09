package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "showtimes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Showtime extends BaseEntity {

    @EmbeddedId
    private ShowtimeId id;

    @MapsId("scheduleId")
    @ManyToOne
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private Schedule schedule;

    @MapsId("roomId")
    @ManyToOne
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    private Room room;

    @OneToMany(mappedBy = "showtime")
    private Set<ShowtimeSeat> showtimeSeats = new HashSet<>();

    public void addShowtimeSeat(ShowtimeSeat showtimeSeat) {
        showtimeSeats.add(showtimeSeat);
        showtimeSeat.setShowtime(this);
    }

    public void removeShowtimeSeat(ShowtimeSeat showtimeSeat) {
        showtimeSeats.remove(showtimeSeat);
        showtimeSeat.setShowtime(null);
    }
}
