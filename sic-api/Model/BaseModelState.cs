using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace sic_api.Model
{
    public class BaseModelState
    {
        public EntityState State { get; set; } = EntityState.Detached;

        public uint? RowVersion { get; set; }
    }
}