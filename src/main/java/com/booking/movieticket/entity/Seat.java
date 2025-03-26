package com.booking.movieticket.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table( name = "seats" )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seat extends BaseEntity
{
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY )
    @Column( name = "seat_id" )
    private Long id;

    @Column( name = "row_name" )
    private String rowName;

    @Column( name = "column_name" )
    private String columnName;

    @OneToMany( mappedBy = "seat" )
    private Set<RoomSeat> roomSeats = new HashSet<>();

    @OneToMany( mappedBy = "seat" )
    private Set<BillDetail> billDetails = new HashSet<>();
}
