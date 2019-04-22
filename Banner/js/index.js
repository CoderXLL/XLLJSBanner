//自执行函数，并把jQuery实例作为参数传入
(function ($) {
    //新增jQuery实例函数，取名为banner
    $.fn.banner = function (options) {
        //合并options至defaults，并赋值给opts
        var opts = $.extend({}, $.fn.banner.defaults, options);
        //遍历jquery实例，并返回其本身
        //返回本身的好处是可以继续链式编程
        return this.each(function () {
            var banner = $(this);
            //获取所有轮播图片容器
            var banner_images = $(".banner_images", banner);
            //获取所有轮播图片容器下的子标签
            var images = banner_images.children();
            //记录子标签数量
            imagesCount = images.length;
            //获取前置后置标签
            var bannerGuide_last = $(".bannerGuide_last", banner);
            var bannerGuide_next = $(".bannerGuide_next", banner);
            //获取3张背景图
            var bannerBg01 = $(".bannerBg01", banner);
            var bannerBg02 = $(".bannerBg02", banner);
            var bannerBg03 = $(".bannerBg03", banner);
            //获取缩略图容器
            var banner_thumbnails = $(".banner_thumbnails", banner);
            //获取缩略图容器下的所有子标签
            var thumbnails = banner_thumbnails.children();
            //获取loading框和banner_content
            var banner_loading = $(".banner_loading", banner);
            var banner_content = $(".banner_content", banner);
            //获取banner_content下的所有图片（包括大图与缩略图）
            // var allImages = $("img", banner_content);
            var allImages = banner_content.find("img");
            //记录当前展示位置
            currentIndex = 0;
            //初始化定时器
            var timer;
            //遍历这些图片
            loaded = 0;
            allImages.each(function () {
                //新建一个img标签，并处理其load闭包  ????
                //新建一个img标签的原因，是避免原img缓存后，不执行load闭包
                $('<img/>').load(function () {
                    ++loaded;
                    if (loaded == imagesCount * 2) { //说明加载完成
                        //隐藏加载框
                        banner_loading.hide();
                        //显示banner_content
                        banner_content.show();
                        //获取第一张大图宽度
                        var firstImage_width = $(".banner_images").find("img:first").width();
                        //设置标签的大小位置
                        set_width(banner_images,
                            images,
                            imagesCount,
                            bannerBg01,
                            bannerBg02,
                            bannerBg03,
                            firstImage_width,
                            bannerGuide_last,
                            bannerGuide_next);
                        //设置缩略图容器宽度
                        banner_thumbnails.css({
                            "width": firstImage_width + 'px',
                            "margin-left": -firstImage_width * 0.5 + 'px'
                        });
                        //遍历缩略图
                        thumbnails.each(function (index) {
                            var thumbnailSpace = firstImage_width / (thumbnails.length + 1);
                            var angle 	= Math.floor(Math.random()*41)-20;
                            $(this).css({
                                "left": thumbnailSpace * (index + 1) - $(this).width() * 0.5,
                                "transform": 'rotate('+ angle +'deg)'
                            });
                            //为每个缩略图绑定指定事件
                            $(this).bind('mouseenter', function () {
                                $(this).stop().animate({top:'-10px'}, 100);
                            }).bind('mouseleave', function () {
                                $(this).stop().animate({top:'0px'}, 100);
                            }).bind('click', function () {
                                currentIndex = index;
                                scrollTo(currentIndex, banner_images, bannerBg01, bannerBg02, bannerBg03);
                                thumbHighlight(thumbnails.eq(currentIndex));
                                clearInterval(timer);
                            });
                        });
                        //使第一个缩略图高亮
                        thumbHighlight(thumbnails.eq(0));
                        //燥起来燥起来
                        //为前置后置标签绑定点击事件
                        bannerGuide_next.bind('click', function () {
                            ++currentIndex;
                            if (currentIndex >= imagesCount) {
                                currentIndex = 0;
                            }
                            scrollTo(currentIndex, banner_images, bannerBg01, bannerBg02, bannerBg03);
                            thumbHighlight(thumbnails.eq(currentIndex));
                        });
                        bannerGuide_last.bind('click', function () {
                            --currentIndex;
                            if (currentIndex < 0) {
                                currentIndex = imagesCount - 1;
                            }
                            scrollTo(currentIndex, banner_images, bannerBg01, bannerBg02, bannerBg03);
                            thumbHighlight(thumbnails.eq(currentIndex));
                        });
                        if (opts.autoDuration > 0) {
                            timer = setInterval(function () {
                                bannerGuide_next.trigger('click');
                            }, opts.autoDuration);
                        }
                        //相当于iOS的layoutSubviews方法？？
                        // $(window).resize(function(){
                        //     set_width(
                        //         banner_images,
                        //         images,
                        //         imagesCount,
                        //         bannerBg01,
                        //         bannerBg02,
                        //         bannerBg03,
                        //         firstImage_width,
                        //         bannerGuide_last,
                        //         bannerGuide_next);
                        // });
                    }
                }).attr('src',$(this).attr('src'));
            });
        });
    };

    //自定义缩略图高亮函数
    var thumbHighlight = function (thumbElement) {
        //兄弟节点都移除selected类选择器
        thumbElement.siblings().removeClass('selected');
        thumbElement.addClass('selected');
    };

    var window_width = $(window).width();
    //自定义滚动方法
    var scrollTo = function (currentIndex,
                             banner_images,
                             bannerBg01,
                             bannerBg02,
                             bannerBg03) {
        var contentOffsetX = -window_width * currentIndex;
        banner_images.stop().animate({
            left: contentOffsetX + 'px'
        }, 1000, 'swing');
        bannerBg01.stop().animate({
            left: contentOffsetX * 0.5 + 'px'
        }, 1000, 'swing');
        bannerBg02.stop().animate({
            left: contentOffsetX * 0.25 + 'px'
        }, 1000, 'swing');
        bannerBg03.stop().animate({
            left: contentOffsetX * 0.125 + 'px'
        }, 1000, 'swing');
    };

    //自定义一个设置宽度的方法
    var set_width = function (banner_images,
                              images,
                              imagesCount,
                              bannerBg01,
                              bannerBg02,
                              bannerBg03,
                              firstImage_width,
                              bannerGuide_last,
                              bannerGuide_next) {
        //计算出需要的总宽度
        var contentSize_Width = imagesCount * window_width;
        //设置大图容器宽度
        banner_images.width(contentSize_Width + 'px');
        //设置所有的图片容器的子标签的宽度
        images.width(window_width + 'px');
        //设置背景图的宽度
        bannerBg01.width(contentSize_Width + 'px');
        bannerBg02.width(contentSize_Width + 'px');
        bannerBg03.width(contentSize_Width + 'px');
        //计算出前后置标签位置
        var guidePosition = (window_width - firstImage_width) * 0.5 + 3;
        bannerGuide_last.css({"left": guidePosition + 'px'});
        bannerGuide_next.css({"right": guidePosition + 'px'});

    };
    $.fn.banner.defaults = {
        autoDuration: 0
    };
})(jQuery);

$(document).ready(function () {
    $("#banner").banner({});
});
