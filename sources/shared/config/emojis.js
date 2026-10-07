"use strict";
/**
 * Catalogo de emojis personalizados de Maple.
 *
 * Los IDs viven aqui y en ningun otro sitio: si se resuben los emojis o cambia
 * el servidor que los aloja, se edita este archivo y nada mas. Antes estaban
 * repetidos por cinco archivos, y un ID equivocado no da error de compilacion
 * sino que Discord lo muestra al usuario como texto crudo.
 *
 * Para que se vean en servidores ajenos el bot necesita UseExternalEmojis.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMOJI = void 0;
exports.EMOJI = {
    /** Expresiones propias, usadas en las respuestas de send(). */
    okay: '<:okay:1533702743233925160>',
    tea: '<:tea:1533702747033964615>',
    wink: '<:wink:1533702744895000596>',
    kiss: '<:kiss:1533702798372245565>',
    angry: '<:angry:1533702738930696362>',
    idk: '<:idk:1533702736980218018>',
    confused: '<:confused:1533702742051127507>',
    surprise: '<:surprise:1533702740340113520>',
    fall: '<:fall:1533702734602309662>',
    /** Insignias de perfil, para user_flags(). */
    staff: '<:staff:1533961256329941153>',
    partner: '<:partner:1533971787749265532>',
    hypesquad: '<:hypesquad:1533961258552787026>',
    bughunter1: '<:bughunter1:1533971876630499528>',
    bughunter2: '<:bughunter2:1533960902339068166>',
    bravery: '<:bravery:1533961213359423599>',
    brilliance: '<:brilliance:1533961205885047045>',
    balance: '<:balance:1533961197765001428>',
    earlynitro: '<:earlynitro:1533961141968044122>',
    earlydev: '<:earlydev:1533961060095365120>',
    moderator: '<:moderator:1533961001966239795>',
    /** Iconos de interfaz, en los comandos de informacion. */
    slash: '<:slash:1533974691948007434>',
    memberList: '<:Dis_memberList:888232778418749491>',
    channelText: '<:Dis_channelText:888230498214760509>',
    channelThread: '<:Dis_channelThread:888230841942151171>',
    channelRules: '<:Dis_channelRules:888231318876487731>',
    pinnedMessages: '<:Dis_pinnedMessages:888232861684084747>',
    rol: '<:Dis_rol:888234105332981781>',
    sticker: '<:Dis_sticker:888234162903994378>',
    boostLv1: '<:Dis_boostLv1:888234250757890099>',
    boostLv2: '<:Dis_boostLv2:888234340121727006>',
    /**
     * Disponibles pero sin usar todavia. Estaban en `assets/emojis.txt`, un
     * inventario que ningun archivo leia; se recogen aqui para que el catalogo
     * sea la unica lista y ese archivo pueda retirarse.
     */
    blush: '<:blush:1533702735952740362>',
    icon: '<:icon:1533702754084716684>',
};
