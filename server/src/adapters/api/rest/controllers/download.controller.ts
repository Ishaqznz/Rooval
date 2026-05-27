import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('download')
export class DownloadController {
  
  @Get('file')
  @UseGuards(JwtAuthGuard)
  async downloadFile(
    @Query('url') fileUrl: string,
    @Query('name') fileName: string,
    @Res() res: Response
  ) {
    try {
      const response = await fetch(decodeURIComponent(fileUrl));
      
      if (!response.ok) {
        return res.status(400).json({ message: 'Failed to fetch file' });
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const buffer = await response.arrayBuffer();

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${decodeURIComponent(fileName)}"`,
        'Content-Length': buffer.byteLength,
      });

      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error('Download proxy error:', error);
      res.status(500).json({ message: 'Download failed' });
    }
  }
}