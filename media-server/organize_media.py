#!/usr/bin/env python3

import os
import sys
import shutil
import logging
import argparse
from pathlib import Path
import subprocess
import json
from datetime import datetime
import requests
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MediaOrganizer:
    def __init__(self, config: Dict):
        self.config = config
        self.movies_dir = Path(config['paths']['movies'])
        self.tv_dir = Path(config['paths']['tv'])
        self.processing_dir = Path(config['paths']['processing'])
        self.plex_url = config['plex']['url']
        self.plex_token = config['plex']['token']

    def process_video_file(self, file_path: Path) -> None:
        """Process a video file, including transcoding if necessary."""
        try:
            # Get media info
            media_info = self._get_media_info(file_path)
            
            if self._needs_transcoding(media_info):
                logger.info(f"Transcoding {file_path}")
                self._transcode_video(file_path)
            
            # Move to appropriate directory
            if self._is_tv_show(file_path):
                self._organize_tv_show(file_path)
            else:
                self._organize_movie(file_path)
                
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")

    def _get_media_info(self, file_path: Path) -> Dict:
        """Get media information using ffprobe."""
        cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            str(file_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        return json.loads(result.stdout)

    def _needs_transcoding(self, media_info: Dict) -> bool:
        """Check if video needs transcoding based on codec and bitrate."""
        video_stream = next(
            (s for s in media_info['streams'] if s['codec_type'] == 'video'),
            None
        )
        
        if not video_stream:
            return False
            
        codec = video_stream.get('codec_name', '')
        
        # Transcode if not in h264 or h265
        return codec not in ['h264', 'hevc']

    def _transcode_video(self, file_path: Path) -> None:
        """Transcode video to h264/h265 format."""
        output_path = file_path.with_suffix('.new.mkv')
        
        cmd = [
            'ffmpeg',
            '-i', str(file_path),
            '-c:v', 'libx265',
            '-crf', '23',
            '-preset', 'medium',
            '-c:a', 'copy',
            str(output_path)
        ]
        
        subprocess.run(cmd, check=True)
        
        # Replace original with transcoded file
        output_path.replace(file_path)

    def _is_tv_show(self, file_path: Path) -> bool:
        """Determine if file is a TV show based on naming pattern."""
        patterns = [
            r'S\d{2}E\d{2}',  # S01E01
            r'\d{1,2}x\d{2}'  # 1x01
        ]
        
        return any(re.search(pattern, file_path.name) for pattern in patterns)

    def _organize_tv_show(self, file_path: Path) -> None:
        """Organize TV show into appropriate directory structure."""
        # Implementation details for TV show organization
        pass

    def _organize_movie(self, file_path: Path) -> None:
        """Organize movie into appropriate directory structure."""
        # Implementation details for movie organization
        pass

    def refresh_plex(self) -> None:
        """Trigger Plex library scan."""
        url = f"{self.plex_url}/library/sections/all/refresh"
        headers = {'X-Plex-Token': self.plex_token}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            logger.info("Plex library scan triggered successfully")
        except Exception as e:
            logger.error(f"Failed to trigger Plex scan: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Media organization script')
    parser.add_argument('--config', required=True, help='Path to config file')
    args = parser.parse_args()

    with open(args.config) as f:
        config = json.load(f)

    organizer = MediaOrganizer(config)
    
    # Process all files in processing directory
    for file_path in Path(config['paths']['processing']).glob('**/*'):
        if file_path.suffix.lower() in ['.mkv', '.mp4', '.avi']:
            organizer.process_video_file(file_path)
    
    # Refresh Plex library
    organizer.refresh_plex()

if __name__ == '__main__':
    main()
