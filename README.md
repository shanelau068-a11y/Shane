# HEIC to JPEG Converter

A small Python command-line program that converts only `.heic` files in a folder to `.jpg` files. Files that are not HEIC are ignored.

## Install

```bash
python3 -m pip install -r requirements.txt
```

## Usage

Convert HEIC files in one folder, saving JPEG files beside the originals:

```bash
python3 convert_heic_to_jpeg.py /path/to/your/folder
```

Convert HEIC files in a folder and all subfolders:

```bash
python3 convert_heic_to_jpeg.py /path/to/your/folder --recursive
```

Save converted JPEG files into a different output folder:

```bash
python3 convert_heic_to_jpeg.py /path/to/your/folder --output-dir /path/to/jpeg-output
```

Overwrite existing JPEG files:

```bash
python3 convert_heic_to_jpeg.py /path/to/your/folder --overwrite
```

Set JPEG quality from 1 to 100:

```bash
python3 convert_heic_to_jpeg.py /path/to/your/folder --quality 90
```


Delete original HEIC files after successful conversion:

```bash
python3 convert_heic_to_jpeg.py /path/to/your/folder --delete
```
