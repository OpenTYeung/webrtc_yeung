// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "core/css/properties/CSSShorthandPropertyAPIScrollPaddingBlock.h"

#include "core/StylePropertyShorthand.h"
#include "core/css/parser/CSSPropertyParserHelpers.h"

namespace blink {

bool CSSShorthandPropertyAPIScrollPaddingBlock::ParseShorthand(
    CSSPropertyID,
    bool important,
    CSSParserTokenRange& range,
    const CSSParserContext& context,
    const CSSParserLocalContext&,
    HeapVector<CSSProperty, 256>& properties) const {
  return CSSPropertyParserHelpers::ConsumeShorthandVia2LonghandAPIs(
      scrollPaddingBlockShorthand(), important, context, range, properties);
}
}  // namespace blink