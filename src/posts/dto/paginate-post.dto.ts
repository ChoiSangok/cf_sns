import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginationPostDto {
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id_less_than?: number;

  /**
   * 정렬
   */
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  /**
   * 몇 개의 데이터를 응답으로 받을지
   */
  @IsNumber()
  @IsOptional()
  take: number = 20;
}
