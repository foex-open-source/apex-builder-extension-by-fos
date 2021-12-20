const EXPAND_ICON = 'fa-expand';
const RESTORE_ICON = 'fa-compress';
const REGION_MAXIMIZED_CLASS = 'fos-region-fullscreen';
const BLOCK_SCROLLING_CLASS = 'fos-body-region-maximized';

export class ExpandableRegion{

    constructor(config){
        this.regionSelector = config.regionSelector;
        this.buttonContainerSelector = config.buttonContainerSelector;
        this.onExpand = config.onExpand;
        this.onRestore = config.onRestore;
        this.isExpanded = false;
        this.isFirstBtn = config.isFirstBtn;
        this.floatRight = !config.floatRight;

        const buttonElem = document.createElement('button');
        buttonElem.setAttribute('type', 'button');
        buttonElem.setAttribute('title', 'Maximize Region');
        buttonElem.setAttribute('aria-label', 'Maximize Region');
        buttonElem.classList.add('a-Button', 'a-Button--noLabel', 'a-Button--withIcon');
        if(this.floatRight){
            buttonElem.classList.add('u-pullRight');
        }

        const iconElem = document.createElement('span');
        iconElem.setAttribute('aria-hidden', 'true');
        iconElem.classList.add('fa', EXPAND_ICON);

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

        if(this.isFirstBtn){
            document.querySelector(this.buttonContainerSelector).prepend(buttonElem);
        } else {
            document.querySelector(this.buttonContainerSelector).append(buttonElem);
        }
        
        $(document).on('keydown', function(e){
            if(e.key == 'Escape' && me.isExpanded){
                e.stopPropagation();
                me.restore();
            }
        });
    }

    expand(){
        document.querySelector(this.regionSelector).classList.add(REGION_MAXIMIZED_CLASS);
        this.button.firstChild.classList.add(RESTORE_ICON);
        this.button.firstChild.classList.remove(EXPAND_ICON);

        document.querySelector('body').classList.add(BLOCK_SCROLLING_CLASS);

        this.isExpanded = true;

        if(this.onExpand){
            this.onExpand();
        }
    }

    restore(){
        document.querySelector(this.regionSelector).classList.remove(REGION_MAXIMIZED_CLASS);
        this.button.firstChild.classList.add(EXPAND_ICON);
        this.button.firstChild.classList.remove(RESTORE_ICON);

        document.querySelector('body').classList.remove(BLOCK_SCROLLING_CLASS);

        this.isExpanded = false;

        if(this.onRestore){
            this.onRestore();
        }
    }

    isExpanded(){
        return this.isExpanded;
    }
}