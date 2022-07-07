const { Service } = require('egg');
const fs = require('fs');
const path = require('path');
const svgtofont = require("../../svgtofont/lib/index");

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
};

function deleteFolder(filePath) {
  const files = []
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath)
    files.forEach((file) => {
      const nextFilePath = `${filePath}/${file}`
      const states = fs.statSync(nextFilePath)
      if (states.isDirectory()) {
        //recurse
        deleteFolder(nextFilePath)
      } else {
        //delete file
        fs.unlinkSync(nextFilePath)
      }
    })
    fs.rmdirSync(filePath)
  }
}
class IconService extends Service {
  // 获取icon目录下有多少项目文件夹
  async findProDir(dir) {
    let paths = await fs.readdirSync(dir); //同步读取当前目录
    const dirArray = []
    paths.forEach(async function(path){
      var _src = dir +'/'+path;
      const stats = await fs.statSync(_src)
      if (stats.isDirectory()) {
        dirArray.push(path)
      }
    })
    return dirArray
  }
  /* 存储文件
   * files: 文件列表
   * projectName: 存储项目名字
   * iconSrcDir: icon 源文件目录
   * iconDistDir: iconfont 最终生成目录 
   */
  async saveSvg(files, projectName, iconSrcDir, iconDistDir) {
    const dirPath = iconSrcDir + projectName
    // 判断文件夹是否存在，不存在进行重建
    if (!await fs.existsSync(dirPath)) {
      await fs.mkdirSync(dirPath)
    }
    // 先搬运到指定目录
    for (const file of files) {
      const oldpath = file.filepath;
      const newpath = dirPath + '/' + file.filename
      console.log(newpath)
      await fs.renameSync(oldpath, newpath)
    }
    // 然后进行生成 
    const distDir = iconDistDir + projectName 
    if (await fs.existsSync(distDir)) {
      // 先删除
      deleteFolder(distDir)
    }
    await wait(2000);
    const rootPath = path.resolve(process.cwd(), "app", "service", "templates");
    await fs.mkdirSync(distDir)

    svgtofont({
      src: dirPath, // svg path
      dist: distDir, // output path
      fontName: "svgtofont", // font name
      css: true, // Create CSS files.
      // classNamePrefix: 'icon-',
      startUnicode: 0xe001, // unicode start number
      svgicons2svgfont: {
        fontHeight: 1000,
        normalize: true
      },
      // website = null, no demo html files
      website: {
        title: "项目1",
        index: "unicode",
        favicon: path.resolve(rootPath, "favicon.png"),
        // Must be a .svg format image.
        logo: path.resolve(rootPath, "svg", "git.svg"),
        meta: {
          description: "Converts SVG fonts to TTF/EOT/WOFF/WOFF2/SVG format.",
          keywords: "TTF,EOT,WOFF,WOFF2,SVG"
        },
        description: ``,
        links: [
          // {
          //   title: "GitHub",
          //   url: "https://github.com/jaywcjlove/svgtofont"
          // },
          // {
          //   title: "Feedback",
          //   url: "https://github.com/jaywcjlove/svgtofont/issues"
          // },
          {
            title: "Font Class",
            url: "index.html"
          },
          {
            title: "Unicode",
            url: "unicode.html"
          }
        ],
        footerInfo: `Licensed under MIT. `
      }
    }).then(() => {
      console.log('done!');
    });
  }
}

module.exports = IconService;