<template>
    <li v-if="show" :class="[item.className, navItemCls]">
        <v-link :to="opt.baseHref + item.href" :class="[navLinkCls, activeCls]" :id="id" :attrs="childProps" :exact="item.exact">
            {{item.label}}
        </v-link>
        <div :class="opt.childNavMenuClass" :aria-labelledby="id">
            <template v-for="x in item.children">
                <div v-if="x.label === '-'" class="dropdown-divider" :key="x.label" />
                <v-link v-else :key="x.href || x.label" :to="opt.baseHref + x.href" :class="[opt.childNavMenuItemClass, activeClassNav(x, useActivePath)]" :exact="x.exact">
                    {{x.label}}
                </v-link>                   
            </template>
        </div>
    </li>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import {
    NavItem, NavOptions, NavDefaults, safeVarName, activeClassNav,
} from '@servicestack/client';
import { NavBase, sanitizeOptions, routePath } from '../core';

@Component
export class NavLink extends Vue {
    @Prop({ default: null }) item!: NavItem;
    @Prop({ default: () => (null) }) options!: NavOptions;
    @Prop({ default: null }) activePath!: string;
    @Prop({ default: null }) navItemClass!: string;
    @Prop({ default: null }) navLinkClass!: string;

    protected get opt() {
        return sanitizeOptions(NavDefaults.forNav(this.options));
    }

    protected get show() {
        return !(this.item == null || !NavDefaults.showNav(this.item, this.opt.attributes));
    }

    protected get useActivePath() {
        return this.activePath || this.opt.activePath || routePath(this) || '';
    }

    protected get hasChildren() {
        return this.item.children && this.item.children.length > 0;
    }

    protected get navItemCls() {
        return this.hasChildren
            ? this.opt.childNavItemClass
            : this.opt.navItemClass;
    }

    protected get navLinkCls() {
        return this.hasChildren
            ? this.opt.childNavLinkClass
            : this.opt.navLinkClass;
    }

    protected get childProps() {
        return this.hasChildren
            ? {
                'role': 'button',
                'data-toggle': 'dropdown',
                'aria-haspopup': 'true',
                'aria-expanded': 'false',
              }
            : {};
    }

    protected get id() { return this.item.id || this.hasChildren ? safeVarName(this.item.label) : null; }

    protected get activeCls() {
        return activeClassNav(this.item, this.useActivePath);
    }

    protected activeClassNav(x: NavItem, activePath: string) { return activeClassNav(x, activePath); }
}
export default NavLink;
</script>
