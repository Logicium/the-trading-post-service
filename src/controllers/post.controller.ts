import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { AuthGuard } from '../auth.guard';
import { PostType } from '../entities/post.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPost(
    @Request() req: any,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('hours') hours: number,
    @Body('type') type: PostType,
    @Body('category') category: string,
    @Body('tags') tags: string[],
  ) {
    return this.postService.createPost(req.user.sub, {
      title,
      description,
      hours,
      type,
      category,
      tags,
    });
  }

  @Get()
  async getAllPosts(@Query('type') type?: PostType) {
    return this.postService.getAllPosts(type);
  }

  @Get('my-posts')
  @UseGuards(AuthGuard)
  async getMyPosts(@Request() req: any) {
    return this.postService.getUserPosts(req.user.sub);
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Request() req: any,
    @Body('title') title?: string,
    @Body('description') description?: string,
    @Body('hours') hours?: number,
    @Body('category') category?: string,
    @Body('tags') tags?: string[],
    @Body('active') active?: boolean,
  ) {
    return this.postService.updatePost(id, req.user.sub, {
      title,
      description,
      hours,
      category,
      tags,
      active,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deletePost(@Param('id') id: string, @Request() req: any) {
    return this.postService.deletePost(id, req.user.sub);
  }
}
