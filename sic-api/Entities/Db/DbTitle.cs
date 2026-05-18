using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using sic_api.Entities;

namespace sic_api.Entities.Db;

[Table("db_title")]
public class DbTitle : BaseEntity
{

    [Required]
    [MaxLength(20)]
    [Column("person_type")]
    public string PersonType { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [Column("prefix_short_name_en")]
    public string PrefixShortNameEn { get; set; } = default!;


    [Required]
    [MaxLength(100)]
    [Column("prefix_short_name_local")]
    public string PrefixShortNameLocal { get; set; } = default!;


    [MaxLength(100)]
    [Column("suffix_short_name_en")]
    public string? SuffixShortNameEn { get; set; }


    [MaxLength(100)]
    [Column("suffix_short_name_local")]
    public string? SuffixShortNameLocal { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("prefix_name_en")]
    public string PrefixNameEn { get; set; } = default!;


    [Required]
    [MaxLength(100)]
    [Column("prefix_name_local")]
    public string PrefixNameLocal { get; set; } = default!;


    [MaxLength(100)]
    [Column("suffix_name_en")]
    public string? SuffixNameEn { get; set; }


    [MaxLength(100)]
    [Column("suffix_name_local")]
    public string? SuffixNameLocal { get; set; }

    [Column("sort_order")]
    public int? SortOrder { get; set; }

    [Required]
    [Column("is_active")]
    public bool IsActive { get; set; } = false;
}