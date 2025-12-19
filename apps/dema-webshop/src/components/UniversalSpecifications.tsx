'use client';

interface UniversalSpecificationsProps {
  product: any;
  compact?: boolean;
}

export default function UniversalSpecifications({ product, compact = false }: UniversalSpecificationsProps) {
  const badgeClass = compact 
    ? "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
    : "inline-flex items-center px-2 py-1 rounded text-xs font-medium";

  return (
    <div className={`${compact ? 'mb-2' : 'mb-3'} flex flex-wrap gap-${compact ? '1.5' : '2'}`}>
      {product.spec_liquid_temp_range && (
        <span className={`${badgeClass} bg-red-50 text-red-800 border border-red-200`}>
          🌡️ {product.spec_liquid_temp_range}
        </span>
      )}

      {product.spec_max_pressure && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          🔧 {product.spec_max_pressure}
        </span>
      )}

      {product.spec_water_pollution && (
        <span className={`${badgeClass} bg-amber-50 text-amber-800 border border-amber-200`}>
          🌊 {product.spec_water_pollution}
        </span>
      )}

      {product.spec_application_desc && (
        <span className={`${badgeClass} bg-emerald-50 text-emerald-800 border border-emerald-200`}>
          🧭 {product.spec_application_desc}
        </span>
      )}

      {/* Product Code / Model */}
      {product.product_code && (
        <span className={`${badgeClass} bg-slate-50 text-slate-800 border border-slate-200`}>
          🏷️ {product.product_code}
        </span>
      )}

      {/* Power - Combined HP and kW */}
      {product.power_hp && product.power_kw && (
        <span className={`${badgeClass} bg-yellow-50 text-yellow-800 border border-yellow-200`}>
          ⚡ {product.power_hp} hp / {product.power_kw} kW
        </span>
      )}
      {!product.power_hp && product.power_kw && (
        <span className={`${badgeClass} bg-yellow-50 text-yellow-800 border border-yellow-200`}>
          ⚡ {product.power_kw} kW
        </span>
      )}

      {/* Voltage and Electrical */}
      {product.voltage_v && product.frequency_hz && product.phase && (
        <span className={`${badgeClass} bg-violet-50 text-violet-800 border border-violet-200`}>
          🔌 {product.voltage_v}V / {product.frequency_hz}Hz / {product.phase}φ
        </span>
      )}
      {product.voltage_v && !product.frequency_hz && (
        <span className={`${badgeClass} bg-violet-50 text-violet-800 border border-violet-200`}>
          🔌 {product.voltage_v}V
        </span>
      )}

      {/* Pressure - Range or Single */}
      {product.pressure_min_bar && product.pressure_max_bar && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          🔧 {product.pressure_min_bar}-{product.pressure_max_bar} bar
        </span>
      )}
      {!product.pressure_min_bar && product.pressure_max_bar && !product.pressure_work_bar && !product.pressure_bar && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          🔧 {product.pressure_max_bar} bar
        </span>
      )}
      {product.pressure_bar && !product.pressure_display && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          🔧 {product.pressure_bar} bar
        </span>
      )}
      {product.pressure_display && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          🔧 {product.pressure_display}
        </span>
      )}
      {product.pressure_work_bar && !product.pressure_display && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          🔧 {product.pressure_work_bar} bar{product.pressure_max_bar && product.pressure_max_bar !== product.pressure_work_bar ? ' work' : ''}
        </span>
      )}
      {product.pressure_max_bar && product.pressure_work_bar && product.pressure_max_bar !== product.pressure_work_bar && !product.pressure_display && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          🔧 {product.pressure_max_bar} bar max
        </span>
      )}
      {product.pressure_burst_bar && (
        <span className={`${badgeClass} bg-red-50 text-red-800 border border-red-200`}>
          💥 {product.pressure_burst_bar} bar burst
        </span>
      )}
      {product.pressure_height_m && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          📊 {product.pressure_height_m} m
        </span>
      )}

      {/* Flow Rates */}
      {product.intake_l_min && (
        <span className={`${badgeClass} bg-cyan-50 text-cyan-800 border border-cyan-200`}>
          🌬️ {product.intake_l_min} L/min intake
        </span>
      )}
      {product.outtake_l_min && (
        <span className={`${badgeClass} bg-sky-50 text-sky-800 border border-sky-200`}>
          💨 {product.outtake_l_min} L/min output
        </span>
      )}
      {!product.intake_l_min && !product.outtake_l_min && product.flow_l_min && (
        <span className={`${badgeClass} bg-cyan-50 text-cyan-800 border border-cyan-200`}>
          💨 {product.flow_l_min} L/min
        </span>
      )}
      {product.flow_m3_per_h && !product.flow_l_min && (
        <span className={`${badgeClass} bg-cyan-50 text-cyan-800 border border-cyan-200`}>
          💨 {product.flow_m3_per_h} m³/h
        </span>
      )}

      {/* Volume / Capacity / Tank */}
      {product.volume_l && (
        <span className={`${badgeClass} bg-indigo-50 text-indigo-800 border border-indigo-200`}>
          🗜️ {product.volume_l} L tank
        </span>
      )}
      {product.tank_volume_l && (
        <span className={`${badgeClass} bg-indigo-50 text-indigo-800 border border-indigo-200`}>
          🗜️ {product.tank_volume_l} L tank
        </span>
      )}

      {/* Diameters */}
      {product.diameter_mm && !product.inner_diameter_mm && !product.outer_diameter_mm && (
        <span className={`${badgeClass} bg-green-50 text-green-800 border border-green-200`}>
          📏 ø {product.diameter_mm} mm
        </span>
      )}
      {product.diameter_display && !product.diameter_mm && (
        <span className={`${badgeClass} bg-green-50 text-green-800 border border-green-200`}>
          📏 ø {product.diameter_display}
        </span>
      )}
      {product.outer_diameter_mm && (
        <span className={`${badgeClass} bg-green-50 text-green-800 border border-green-200`}>
          ◯ {product.outer_diameter_mm} mm outer
        </span>
      )}
      {product.inner_diameter_mm && (
        <span className={`${badgeClass} bg-blue-50 text-blue-800 border border-blue-200`}>
          ⊙ {product.inner_diameter_mm} mm inner
        </span>
      )}

      {/* Length */}
      {product.length_m && !product.length_display && (
        <span className={`${badgeClass} bg-teal-50 text-teal-800 border border-teal-200`}>
          📐 {product.length_m} m
        </span>
      )}
      {product.length_display && (
        <span className={`${badgeClass} bg-teal-50 text-teal-800 border border-teal-200`}>
          📐 {product.length_display}
        </span>
      )}

      {/* Angle */}
      {product.angle_degrees && (
        <span className={`${badgeClass} bg-slate-50 text-slate-800 border border-slate-200`}>
          📐 {product.angle_degrees}°
        </span>
      )}

      {/* Piston Count */}
      {product.piston_count && (
        <span className={`${badgeClass} bg-purple-50 text-purple-800 border border-purple-200`}>
          🔩 {product.piston_count} piston{product.piston_count > 1 ? 's' : ''}
        </span>
      )}

      {/* RPM */}
      {product.rpm && (
        <span className={`${badgeClass} bg-orange-50 text-orange-800 border border-orange-200`}>
          🔄 {product.rpm} rpm
        </span>
      )}

      {/* Noise Level */}
      {product.noise_db && (
        <span className={`${badgeClass} bg-red-50 text-red-800 border border-red-200`}>
          🔊 {product.noise_db} dB(A)
        </span>
      )}

      {/* Dimensions */}
      {product.dimensions_mm && (
        <span className={`${badgeClass} bg-green-50 text-green-800 border border-green-200`}>
          📏 {product.dimensions_mm}
        </span>
      )}
      {!product.dimensions_mm && product.length_mm && product.width_mm && product.height_mm && (
        <span className={`${badgeClass} bg-green-50 text-green-800 border border-green-200`}>
          📏 {product.length_mm} × {product.width_mm} × {product.height_mm} mm
        </span>
      )}
      {product.width_mm && !product.length_mm && !product.height_mm && (
        <span className={`${badgeClass} bg-lime-50 text-lime-800 border border-lime-200`}>
          ↔️ {product.width_mm} mm
        </span>
      )}

      {/* Weight */}
      {product.weight_kg && !product.weight_display && (
        <span className={`${badgeClass} bg-gray-50 text-gray-800 border border-gray-200`}>
          ⚖️ {product.weight_kg} kg
        </span>
      )}
      {product.weight_display && (
        <span className={`${badgeClass} bg-gray-50 text-gray-800 border border-gray-200`}>
          ⚖️ {product.weight_display}
        </span>
      )}

      {/* Material */}
      {product.material && (
        <span className={`${badgeClass} bg-amber-50 text-amber-800 border border-amber-200`}>
          🔬 {product.material}
        </span>
      )}

      {/* Wall Thickness */}
      {product.wall_thickness_mm && !product.wall_thickness_display && (
        <span className={`${badgeClass} bg-slate-50 text-slate-800 border border-slate-200`}>
          ▭ {product.wall_thickness_mm} mm wall
        </span>
      )}
      {product.wall_thickness_display && (
        <span className={`${badgeClass} bg-slate-50 text-slate-800 border border-slate-200`}>
          ▭ {product.wall_thickness_display} wall
        </span>
      )}

      {/* Thread Size */}
      {product.thread_size && (
        <span className={`${badgeClass} bg-rose-50 text-rose-800 border border-rose-200`}>
          🔩 {product.thread_size}
        </span>
      )}
      
      {/* Connection Type */}
      {product.connection_type && (
        <span className={`${badgeClass} bg-cyan-50 text-cyan-800 border border-cyan-200`}>
          🔗 {product.connection_type}
        </span>
      )}

      {/* Temperature Range */}
      {product.min_temp_c && product.max_temp_c && (
        <span className={`${badgeClass} bg-sky-50 text-sky-800 border border-sky-200`}>
          🌡️ {product.min_temp_c}°C to {product.max_temp_c}°C
        </span>
      )}

      {/* Bearing Type */}
      {product.bearing_type && (
        <span className={`${badgeClass} bg-violet-50 text-violet-800 border border-violet-200`}>
          🏷️ {product.bearing_type}
        </span>
      )}

      {/* Bearing Housing */}
      {product.bearing_housing && (
        <span className={`${badgeClass} bg-pink-50 text-pink-800 border border-pink-200`}>
          🏠 {product.bearing_housing}
        </span>
      )}

      {/* Pillow Block Bearing */}
      {product.pillow_block_bearing && (
        <span className={`${badgeClass} bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200`}>
          🔩 {product.pillow_block_bearing}
        </span>
      )}

      {/* Application */}
      {product.application && (
        <span className={`${badgeClass} bg-emerald-50 text-emerald-800 border border-emerald-200`}>
          🔧 {product.application}
        </span>
      )}

      {/* Pump Type */}
      {product.pump_type && (
        <span className={`${badgeClass} bg-indigo-50 text-indigo-800 border border-indigo-200`}>
          🏭 {product.pump_type}
        </span>
      )}

      {/* Product Category */}
      {product.product_category && (
        <span className={`${badgeClass} bg-emerald-50 text-emerald-800 border border-emerald-200`}>
          📦 {product.product_category}
        </span>
      )}
    </div>
  );
}
