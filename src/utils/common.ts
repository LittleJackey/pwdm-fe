import type { BasePageQueryParam } from '@/types/data'
import type { Sort } from 'element-plus'

export const fillPaginationParams = (baseQuery: BasePageQueryParam, currentPage: number, pageSize: number) => {
  baseQuery.pageNum = currentPage
  baseQuery.pageSize = pageSize
}

export const fillSortParams = (baseQuery: BasePageQueryParam, sort: Sort) => {
  if (sort == null) {
    return
  }
  baseQuery.orderColumn = sort.prop
  baseQuery.orderDirection = sort.order
}
