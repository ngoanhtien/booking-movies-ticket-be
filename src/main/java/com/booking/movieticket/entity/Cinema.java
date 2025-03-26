package com.booking.movieticket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table( name = "cinemas" )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cinema extends BaseEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_cinema")
    @SequenceGenerator(name = "sequence_cinema")
    @Column( name = "cinema_id" )
    private Long id;

    @Column( name = "cinema_name" )
    @Nationalized
    private String name;

    @Column( name = "room_image" )
    private String imageUrl;

    @Column( name = "address", length = 500 )
    @Nationalized
    private String address;

    @Column( name = "hotline" )
    private String hotline;

    @Column( name = "description", length = 1000 )
    @Nationalized
    private String description;

    @OneToMany( mappedBy = "cinema" )
    private Set<Room> rooms = new HashSet<>();

    private Integer rating;
}
