!function(t){var n=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;upfrontrjs.define(["scripts/upfront/upfront-views-editor/commands/command"],function(t){return t.extend({className:"command-save sidebar-commands-button blue",render:function(){Upfront.Events.on("upfront:save:label",this.update_label,this),this.$el.html(n.save),this.$el.prop("title",n.save)},update_label:function(t){var n=this;setTimeout(function(){n.$el.html(t),n.$el.prop("title",t)},200)},on_click:function(){_upfront_post_data.layout.specificity&&_upfront_post_data.layout.item&&!_upfront_post_data.layout.item.match(/-page/)?Upfront.Events.trigger("command:layout:save_as"):Upfront.Events.trigger("command:layout:save")}})})}(jQuery);