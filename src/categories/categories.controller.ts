import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseFilters } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';

@Controller('categories')
@ApiBearerAuth('access-token')
@UseGuards(new RoleGuard(['admin']))
@UseFilters(CatchEverythingFilter)
@ApiTags('Categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới', description: 'Tạo danh mục mới cho một ví cụ thể' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục', description: 'Lấy danh sách tất cả danh mục trong tất cả các ví' })
  @ApiOkResponse({ description: 'Lấy danh sách danh mục thành công' })
  @ApiNotFoundResponse({ description: 'Không có danh mục nào' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Lấy thông tin danh mục theo ID', description: 'Lấy thông tin chi tiết của một danh mục theo ID danh mục'})
  @ApiOkResponse({ description: 'Lấy thông tin danh mục thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy danh mục' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch('update/:id')
  @ApiOperation({summary: 'Cập nhật thông tin danh mục theo ID', description: 'Cập nhật thông tin của một danh mục theo ID'})
  @ApiNotFoundResponse({ description: 'Không tìm thấy danh mục' })
  @ApiOkResponse({ description: 'Cập nhật thông tin danh mục thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ hoặc cập nhật danh mục thất bại' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch('delete/:id')
  @ApiOperation({summary: 'Xóa danh mục theo ID', description: 'Xóa một danh mục theo ID'})
  @ApiNotFoundResponse({ description: 'Không tìm thấy danh mục' })
  @ApiOkResponse({ description: 'Xóa danh mục thành công' })
  @ApiBadRequestResponse({ description: 'Xóa danh mục thất bại' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
