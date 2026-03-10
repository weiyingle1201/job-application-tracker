"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterOptions, ApplicationStatus } from "@/lib/types"

interface FilterBarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  locations: string[]
}

const STATUS_OPTIONS: (ApplicationStatus | "all")[] = [
  "all",
  "未投递",
  "已投递",
  "一面",
  "二面",
  "三面",
  "已拒",
  "录用",
]

export function FilterBar({ filters, onFiltersChange, locations }: FilterBarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索公司或职位..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value as ApplicationStatus | "all" })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="状态筛选" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {status === "all" ? "全部状态" : status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.location}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, location: value })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="地点筛选" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部地点</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
