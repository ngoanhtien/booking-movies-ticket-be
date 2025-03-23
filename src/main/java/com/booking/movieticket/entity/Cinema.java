package com.booking.movieticket.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cinemas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cinema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cinema_id")
    private Long id;

    @Column(name = "cinema_name")
    @Nationalized
    @NotBlank(message = "Tên rạp không được để trống")
    @Size(max = 100, message = "Tên rạp không được vượt quá 100 ký tự")
    private String name;

    @Column(name = "room_image")
    private String imageUrl;

    @Column(name = "address", length = 500)
    @Nationalized
    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;

    @Column(name = "hotline")
    @NotBlank(message = "Hotline không được để trống")
    @Pattern(regexp = "\\d{10,15}", message = "Hotline không đúng định dạng")
    private String hotline;

    @Column(name = "description", length = 1000)
    @Nationalized
    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;

    private Integer rating;

    @Column(name = "is_enabled")
    private Boolean isEnabled;

    @OneToMany(mappedBy = "cinema")
    @JsonIgnore
    private Set<Room> rooms = new HashSet<>();

}
