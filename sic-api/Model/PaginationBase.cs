using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace sic_api.Model
{
    public class PaginationBase<TModel>
    {
        public TModel[] Data { get; set; } = [];

        public Pageable Pageable { get; set; } = new Pageable();
    }
}