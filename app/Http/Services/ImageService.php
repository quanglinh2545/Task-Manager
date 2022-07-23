<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Log;

class ImageService
{
    public function compressImage($file, $folderFile, $fileName, $quality)
    {
        $src = $file->getPathName();
        $info = getimagesize($src);
        if ($info['mime'] == 'image/jpeg') {
            $image = imagecreatefromjpeg($src);
            $ext = '.jpeg';
        } elseif ($info['mime'] == 'image/gif') {
            $image = imagecreatefromgif($src);
            $ext = '.gif';
        } elseif ($info['mime'] == 'image/png') {
            $image = imagecreatefrompng($src);
            $ext = '.png';
        } else if ($info['mime'] == 'image/jpg') {
            $image = imagecreatefromjpeg($src);
            $ext = '.jpg';
        } else {
            return false;
        }
        $dest = $folderFile . '/' . $fileName . $ext;
        imagejpeg($image, $dest, $quality);
        return $dest;
    }
    public function imageResize($src, $wConfig, $hConfig)
    {
        $dirPath = storage_path('/app/public/uploads');
        $fileType = null;
        if (!empty($src)) {
            if (file_exists($src)) {
                Log::debug($src);
                $file = getimagesize($src);
                $width = $file[0];
                $height = $file[1];
                // make image resource
                switch ($file['mime']) {
                    case 'image/jpeg':
                        $fileType = 'jpeg';
                        $image = imagecreatefromjpeg($src);
                        break;
                    case 'image/png':
                        $fileType = 'png';
                        $image = imagecreatefrompng($src);
                        break;
                    case 'image/gif':
                        $fileType = 'gif';
                        $image = imagecreatefromgif($src);
                        break;
                    default:
                        $fileType = 'jpg';
                        $image = imagecreatefromjpeg($src);
                        break;
                }
                $thumbName = time() . '-thumb-' . $wConfig . 'x' . $hConfig;
                $thumbImage = $thumbName . '.' . $fileType;

                $pathToImage = $dirPath . '/' . $thumbImage;
                if (!file_exists($pathToImage)) {
                    $wThum = $wConfig;
                    $hThum = $hConfig;
                    $width = $file[0];
                    $height = $file[1];
                    if ($wThum > $width || $hThum > $height) {
                        $imageCrop = $this->resizeImageMax($image, $wThum, $hThum);
                        $this->saveImage($imageCrop, $file, $dirPath . '/' . $thumbImage);
                        imagedestroy($imageCrop);
                        return $thumbName . '.' . $fileType;
                    }
                    $imageCrop = $this->resizeImageCrop($image, $wThum, $hThum);
                    $this->saveImage($imageCrop, $file, $dirPath . '/' . $thumbImage);
                    imagedestroy($imageCrop);
                    return $thumbName . '.' . $fileType;
                } else {
                    return $thumbName . '.' . $fileType;
                }
            }
            return null;
        }
        return null;
    }

    private function resizeImageCrop($image, $width, $height)
    {
        // Log::debug('resizeImageCrop');
        $w = @imagesx($image); //current width
        $h = @imagesy($image); //current height
        if ((!$w) || (!$h)) {
            return null;
        }
        // no resizing needed
        if (($w == $width) && ($h == $height)) {
            return $image;
        }

        // try max width first
        $ratio = $width / $w;
        $newW = $width;
        $newH = $h * $ratio;

        //if that created an image smaller than what we wanted, try the other way
        if ($newH < $height) {
            $ratio = $height / $h;
            $newH = $height;
            $newW = $w * $ratio;
        }

        $image2 = imagecreatetruecolor($newW, $newH);
        imagecopyresampled($image2, $image, 0, 0, 0, 0, $newW, $newH, $w, $h);

        //check to see if cropping needs to happen
        if (($newH != $height) || ($newW != $width)) {
            $image3 = imagecreatetruecolor($width, $height);
            if ($newH > $height) { //crop vertically
                $extra = $newH - $height;
                $x = 0; //source x
                $y = round($extra / 2); //source y
                imagecopyresampled($image3, $image2, 0, 0, $x, $y, $width, $height, $width, $height);
            } else {
                $extra = $newW - $width;
                $x = round($extra / 2); //source x
                $y = 0; //source y
                imagecopyresampled($image3, $image2, 0, 0, $x, $y, $width, $height, $width, $height);
            }
            imagedestroy($image2);
            return $image3;
        } else {
            return $image2;
        }
    }

    private function resizeImageMax($image, $maxWidth, $maxHeight)
    {
        $w = imagesx($image); //current width
        $h = imagesy($image); //current height
        if ((!$w) || (!$h)) {
            return $image;
        }

        if (($w <= $maxWidth) && ($h <= $maxHeight)) {
            // no resizing needed
            return $image;
        }

        //try max width first
        $ratio = $maxWidth / $w;
        $newW = $maxWidth;
        $newH = $h * $ratio;

        //if that didn't work
        if ($newH > $maxHeight) {
            $ratio = $maxHeight / $h;
            $newH = $maxHeight;
            $newW = $w * $ratio;
        }

        $newImage = imagecreatetruecolor($newW, $newH);
        imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newW, $newH, $w, $h);
        return $newImage;
    }

    private function saveImage($imageSource, $file, $path)
    {
        switch ($file['mime']) {
            case 'image/jpeg':
                imagejpeg($imageSource, $path, 80);
                break;
            case 'image/png':
                imagepng($imageSource, $path);
                break;
            case 'image/gif':
                imagegif($imageSource, $path);
                break;
            default:
                imagejpeg($imageSource, $path, 80);
                break;
        }
    }


    public function getExtensionFile($srcImage)
    {
        $arr = explode('.', $srcImage);
        return strtolower($arr[count($arr) - 1]);
    }
    private function isImage($path)
    {
        $ext = strtolower($this->getExtensionFile($path));
        $arr = ['jpg', 'jpeg', 'gif', 'png'];
        return in_array($ext, $arr);
    }
}
