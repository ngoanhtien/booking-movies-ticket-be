package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "branchs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Branch extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_branch")
    @SequenceGenerator(name = "sequence_branch")
    @Column(name = "branch_id")
    private Long id;

    @Column(name = "branch_name")
    @Nationalized
    private String name;

    @Column(name = "room_image", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "address", length = 500)
    @Nationalized
    private String address;

    @Column(name = "hotline")
    private String hotline;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "rating")
    private Integer rating;

    @OneToMany(mappedBy = "branch")
    private Set<Room> rooms = new HashSet<>();

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cinema_id", referencedColumnName = "cinema_id")
    private Cinema cinema;

}
