package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.StatusMovie;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table( name = "movies" )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Movie extends BaseEntity
{
    @Id
    @GeneratedValue( strategy = GenerationType.SEQUENCE, generator = "sequence_movie" )
    @SequenceGenerator( name = "sequence_movie" )
    @Column( name = "movie_id" )
    private Long id;

    @Nationalized
    @Column( name = "name_movie", nullable = false )
    private String name;

    @Nationalized
    @Column( name = "summary", nullable = false )
    private String summary;

    @Column( name = "duration" )
    private Integer duration;

    @Column( name = "release_date", columnDefinition = "DATE" )
    private LocalDate releasedDate;

    @Nationalized
    @Column( name = "author", nullable = false )
    private String author;

    @Nationalized
    @Column( name = "actor", nullable = false )
    private String actor;

    @Nationalized
    @Column( name = "language", nullable = false )
    private String language;

    @Column( name = "trailer", columnDefinition = "VARCHAR(255)" )
    private String trailerUrl;

    @Column( name = "movie_status" )
    @Enumerated( EnumType.STRING )
    private StatusMovie status;

    @Column( name = "image_small" )
    private String imageSmallUrl;

    @Column( name = "image_large" )
    private String imageLargeUrl;

    @OneToMany( mappedBy = "movie" )
    private Set<Schedule> schedules;

    @ManyToMany
    @JoinTable( name = "category_movie", joinColumns = @JoinColumn( name = "movie_id", referencedColumnName = "id" ), inverseJoinColumns = @JoinColumn( name = "category_id", referencedColumnName = "id" ) )
    private Set<Category> categories = new HashSet<>();

    @OneToMany( mappedBy = "movie" )
    private Set<Review> reviews = new HashSet<>();
}
