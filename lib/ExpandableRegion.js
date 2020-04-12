export class ExpandableRegion{

    static EXPAND_ICON = 'fa-expand';
    static RESTORE_ICON = 'fa-compress';
    static REGION_MAXIMIZED_CLASS = 'fos-region-fullscreen';
    static BLOCK_SCROLLING_CLASS = 'fos-body-region-maximized';

    constructor(config){
        this.regionSelector = config.regionSelector;
        this.onExpand = config.onExpand;
        this.onRestore = config.onRestore;
        this.isExpanded = false;

        const buttonElem = document.createElement('button');
        buttonElem.setAttribute('type', 'button');
        buttonElem.setAttribute('title', 'Maximize Region');
        buttonElem.setAttribute('aria-label', 'Maximize Region');
        buttonElem.classList.add('a-Button', 'a-Button--noLabel', 'a-Button--withIcon', 'u-pullRight');

        const iconElem = document.createElement('span');
        iconElem.setAttribute('aria-hidden', 'true');
        iconElem.classList.add('fa', ExpandableRegion.EXPAND_ICON);

        const me = this;
        buttonElem.addEventListener('click', function(){
            if(me.isExpanded){
                me.restore();
            } else {
                me.expand();
            }
        });

        buttonElem.append(iconElem);
        this.button = buttonElem;

        document.querySelector(config.buttonContainerSelector).append(buttonElem);

        $(document).on('keydown', function(e){
            if(e.key == 'Escape' && me.isExpanded){
                e.stopPropagation();
                me.restore();
            }
        });
    }

    expand(){
        document.querySelector(this.regionSelector).classList.add(ExpandableRegion.REGION_MAXIMIZED_CLASS);
        this.button.firstChild.classList.add(ExpandableRegion.RESTORE_ICON);
        this.button.firstChild.classList.remove(ExpandableRegion.EXPAND_ICON);

        document.querySelector('body').classList.add(ExpandableRegion.BLOCK_SCROLLING_CLASS);

        this.isExpanded = true;

        if(this.onExpand){
            this.onExpand();
        }
    }

    restore(){
        document.querySelector(this.regionSelector).classList.remove(ExpandableRegion.REGION_MAXIMIZED_CLASS);
        this.button.firstChild.classList.add(ExpandableRegion.EXPAND_ICON);
        this.button.firstChild.classList.remove(ExpandableRegion.RESTORE_ICON);

        document.querySelector('body').classList.remove(ExpandableRegion.BLOCK_SCROLLING_CLASS);

        this.isExpanded = false;

        if(this.onRestore){
            this.onRestore();
        }
    }

    isExpanded(){
        return this.isExpanded;
    }
}